import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Configuration, OpenAIApi } from 'openai';
import { db } from '../../firebase.config';

export default withApiAuthRequired(async function handler(req, res) {

  const { user } = await getSession(req, res);

  // get user data from firestore
  const docRef = doc(db, "users", `${user.sub}-${user.email}`);
  const userDocSnap = await getDoc(docRef);

  let userDocData;

  // if user document doesn't exist or user doesn't have any tokens, give them one free token
  if (!userDocSnap.exists || !userDocSnap.data()?.availableTokens) {
    await setDoc(docRef, {
      availableTokens: 1
    }, { merge: true });
    userDocData = { availableTokens: 1 };
  } else {
    userDocData = userDocSnap.data();
  }

  // if user doesn't have enough tokens, return 403
  if (userDocData.availableTokens < 1) {
    res.status(403);
    return;
  }

  const configuration = new Configuration({
    organization: 'org-MbcCMiLnIXBQOxkwLsQR4MZq',
    apiKey: process.env.OPENAI_API_KEY,
  })
  const openai = new OpenAIApi(configuration)

  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: `${req.body.prompt}` }],
  });
  const response = completion.data.choices[0].message.content;

  console.log(response, 'response: ');

  const result = await fetch(
    `https://es.wikivoyage.org/w/api.php?origin=*&format=json&formatversion=2&action=parse&page=${req.body.userInput}&prop=text`
  );
  const respon = await result.json();

  const content = respon?.parse?.text ?? ""

  const cleanedContent = content.replace(/Esta guía es [\s\S]*?ayuda a mejorarlo/g, "");
  const cleanedContent2 = cleanedContent.replace(/Este artículo [\s\S]*?otros artículos/g, "");
  const cleanedContent3 = cleanedContent2.replace(/Este artículo [\s\S]*?GNU Free Documentation License/g, "");
  const cleanedContent4 = cleanedContent3.replace(/<a href=[^>]*class="mw-file-description">/g, "");

  const finalContent = cleanedContent4.replace(/\beditar\b/g, "");

  // deduct 1 token from user's available tokens
  await updateDoc(docRef, {
    availableTokens: userDocData.availableTokens - 1,
  });

  // create custom id for itinerary
  const newItineraryId = String(new Date().getTime())

  // add itinerary to firestore
  await setDoc(doc(db, "itineraries", newItineraryId), {
    apiOutput: response,
    info: finalContent,
    title: `${req.body.userInput} - ${req.body.selectedMonth}`,
    userId: `${user.sub}-${user.email}`,
    created: new Date().toISOString(),
    _id: newItineraryId
  });

  res.status(200).json({
    itineraryId: newItineraryId,
  });
});
