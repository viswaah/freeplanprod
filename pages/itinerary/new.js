import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { faBrain } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { AppLayout } from '../../components/AppLayout';
import { getAppProps } from '../../utils/getAppProps';

import { useState, useRef } from "react";

import Linkify from "react-linkify";
import Image from "next/image";
import validator from "validator";
import axios from "axios";

import { jsPDF } from "jspdf";


import Logo2 from "../../assets/logo2.png";
import Duration from '../../components/Inputs/Duration';
import Month from '../../components/Inputs/Month';
import UserInput from '../../components/Inputs/UserInput';
import { useIntl } from 'react-intl';

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];


const NewItinerary = () => {

  const intl = useIntl();

  const getText = (id) => intl.formatMessage({ id });

  const router = useRouter();
  const [duration, setDuration] = useState(3);
  const [userInput, setUserInput] = useState("");
  const [apiOutput, setApiOutput] = useState("");
  const [info, setInfo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getText("month.any"));

  const divRef = useRef(null);

  const callGenerateEndpoint = async (e) => {

    e.preventDefault();
    setIsGenerating(true);

    let prompt = `${getText('new.generateitineraryof')} ${duration} ${getText('new.generateitineraryto')} ${userInput} ${getText('new.generateitinerarynext')} ${selectedMonth}  ${getText('new.generateitineraryplan')}  ${getText('new.generateitineraryplan2')}  ${getText('new.generateitineraryplan3')}`;
    console.log('THE prompt!!!', prompt);

    try {
      const response = await fetch(`/api/generateItinerary`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ prompt, userInput, selectedMonth }),
      });
      const json = await response.json();
      if (json?.itineraryId) {
        router.push(`/itinerary/${json.itineraryId}`);
      }
    } catch (e) {
      setIsGenerating(false);
    }
  };

  return (
    <div className="root">
      <div className="flex">

        <div className="container-left">
        
                {getText("new.title")}
          

          <div className="prompt-container">

            <UserInput userInput={userInput} setUserInput={setUserInput} />

            <div className="flex w-100 mt-4">

              <Duration duration={duration} setDuration={setDuration} />

              <Month months={months} setSelectedMonth={setSelectedMonth} selectedMont={selectedMonth} />
            </div>

            <div className="prompt-buttons">
              <button
                className="pushable py-2 px-4 rounded"
                onClick={callGenerateEndpoint}
                disabled={isGenerating}
              >
                <span className="shadow"></span>
                <span className="edge"></span>
                <div className="front">
                  {isGenerating ? (
                    <div>
                      <span className="loader mr-2"></span>
                      <span>
                        {getText('new.preparing')}
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold">{getText('new.generate')}</span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default NewItinerary;

NewItinerary.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);

// if there are no tokens, redirect to the topup page
    if (!props.availableTokens) {
      return {
        redirect: {
          destination: '/token-topup',
          permanent: false,
        },
      };
    }

    return {
      props,
    };
  },
});
