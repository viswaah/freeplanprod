import { getSession } from "@auth0/nextjs-auth0";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase.config";

export const getAppProps = async (ctx) => {
  const userSession = await getSession(ctx.req, ctx.res);

  // get user data from firestore
  const docRef = doc(
    db,
    "users",
    `${userSession.user.sub}-${userSession.user.email}`
  );
  const userDocSnap = await getDoc(docRef);

  // if user doesn't exist in firestore, that means they have'nt purchased any tokens or itineraries. so give 0 and []
  if (!userDocSnap.exists()) {
    const docRef = doc(
      db,
      "users",
      `${userSession.user.sub}-${userSession.user.email}`
    );
    setDoc(docRef, {
      availableTokens: 1,
      receiveFreeToken: true,
    });
    return {
      availableTokens: 1,
      itineraries: [],
    };
  }

  // get user's itineraries from firestore
  const rawItineraries = await getDocs(
    query(
      collection(db, "itineraries"),
      where("userId", "==", `${userSession.user.sub}-${userSession.user.email}`)
    )
  );

  // sort itineraries by created date
  const sortedItineraries = rawItineraries.docs.sort((a, b) => {
    return b.data().created - a.data().created;
  });

  // return the first 5 itineraries and the user's available tokens
  return {
    availableTokens: userDocSnap.data().availableTokens,
    itineraries: sortedItineraries.slice(0, 5).map((doc) => {
      return {
        ...doc.data(),
        created: new Date(doc.data().created).toString(),
      };
    }),
    itineraryId: ctx.params?.itineraryId || null,
  };
};
