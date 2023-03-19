import { useUser } from "@auth0/nextjs-auth0/client";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import ItinerariesContext from "../../context/itinerariesContext";

export const AppLayout = ({
  children,
  availableTokens,
  itineraries: itinerariesFromSSR,
  itineraryId,
  itineraryCreated,
}) => {
  const currentLanguage = useIntl().locale;
  const [showMenu, setShowMenu] = useState(false);

  const intl = useIntl();

  const getText = (id) => intl.formatMessage({ id });

  const { user } = useUser();

  const {
    setItinerariesFromSSR,
    itineraries,
    getItineraries,
    noMoreItineraries,
  } = useContext(ItinerariesContext);

  useEffect(() => {
    console.log(itineraries);
    setItinerariesFromSSR(itinerariesFromSSR);
    if (itineraryId) {
      const exists = itinerariesFromSSR?.find(
        (itinerary) => itinerary._id === itineraryId
      );
      if (!exists) {
        getItineraries({
          getNewerItineraries: true,
          lastItineraryDate: itineraryCreated,
        });
      }
    }
  }, [
    itinerariesFromSSR,
    setItinerariesFromSSR,
    itineraryId,
    itineraryCreated,
    getItineraries,
  ]);

  return (
    <div style={{ height: "80%" }}>
      <div className="grid xl:grid-cols-[200px_1fr] lg:grid-cols-[200px_1fr] md:grid-cols-[200px_1fr] grid-cols-[1fr]">
        <div className="xl:flex lg:flex md:flex flex-col text-white overflow-hidden hidden">
          <div className="bg-slate-800 px-2">
            <Link
              href={`/${currentLanguage}/itinerary/new`}
              className="btn mt-3 mb-4"
            >
              {getText("applayout.newbtn")}
            </Link>
            <Link
              href={`/${currentLanguage}/token-topup`}
              className="block mt-2 text-center"
            >
              <FontAwesomeIcon icon={faCoins} className="text-yellow-500" />
              <span className="pl-1">
                {availableTokens ? availableTokens : 0}{" "}
                {getText("applayout.tokens")}
              </span>
            </Link>
          </div>
          <div className="px-4 flex-1 overflow-auto bg-gradient-to-b from-slate-800 to-cyan-800">
            {itineraries.map((itinerary) => (
              <Link
                key={itinerary._id}
                href={`/${currentLanguage}/itinerary/${itinerary._id}`}
                className={`py-1 border border-white/0 block text-ellipsis overflow-hidden whitespace-nowrap my-1 px-2 bg-white/10 cursor-pointer rounded-sm ${
                  itineraryId === itinerary._id
                    ? "bg-white/20 border-white"
                    : ""
                }`}
              >
                {itinerary.title}
              </Link>
            ))}
            {!noMoreItineraries && (
              <div
                onClick={() => {
                  getItineraries({
                    lastItineraryDate:
                      itineraries[itineraries.length - 1]?.created,
                  });
                }}
                className="hover:underline text-sm text-slate-400 text-center cursor-pointer mt-4"
              >
                {getText("applayout.morebtn")}
              </div>
            )}
          </div>
          <div className="bg-cyan-800 flex items-center gap-2 border-t border-t-black/50 h-24 px-2">
            {!!user ? (
              <>
                <div className="min-w-[20px]">
                  <Image
                    src={user.picture}
                    alt={user.name}
                    height={20}
                    width={20}
                    className="rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-bold" style={{ wordBreak: "break-all" }}>
                    {user.email}
                  </div>
                  <Link className="text-sm" href="/api/auth/logout">
                    {getText("applayout.logout")}
                  </Link>
                </div>
              </>
            ) : (
              <Link href="/api/auth/login">{getText("applayout.login")}</Link>
            )}
          </div>
        </div>
        {children}
      </div>
      {/* mobile side bar i didn't understand much of you code so i reuse the code and make changes in it to adopt responsive design 
        you can make separate sidebar component and reuse it both for mobile and desktop design */}
      <div
        className={`xl:hidden lg:hidden md:hidden block absolute top-0 bottom-0 transition-all ${
          showMenu ? "left-0" : "-left-[200px]"
        }`}
      >
        <div className="flex-col text-white overflow-hidden flex h-[100%] w-[200px] relative">
          <div className="bg-slate-800 px-2 pt-6">
            <Link
              href={`/${currentLanguage}/itinerary/new`}
              className="btn mt-3 mb-4"
            >
              {getText("applayout.newbtn")}
            </Link>
            <Link
              href={`/${currentLanguage}/token-topup`}
              className="block mt-2 text-center"
            >
              <FontAwesomeIcon icon={faCoins} className="text-yellow-500" />
              <span className="pl-1">
                {availableTokens ? availableTokens : 0}{" "}
                {getText("applayout.tokens")}
              </span>
            </Link>
          </div>
          <div className="px-4 flex-1 overflow-auto bg-gradient-to-b from-slate-800 to-cyan-800">
            {itineraries.map((itinerary) => (
              <Link
                key={itinerary._id}
                href={`/${currentLanguage}/itinerary/${itinerary._id}`}
                className={`py-1 border border-white/0 block text-ellipsis overflow-hidden whitespace-nowrap my-1 px-2 bg-white/10 cursor-pointer rounded-sm ${
                  itineraryId === itinerary._id
                    ? "bg-white/20 border-white"
                    : ""
                }`}
              >
                {itinerary.title}
              </Link>
            ))}
            {!noMoreItineraries && (
              <div
                onClick={() => {
                  getItineraries({
                    lastItineraryDate:
                      itineraries[itineraries.length - 1]?.created,
                  });
                }}
                className="hover:underline text-sm text-slate-400 text-center cursor-pointer mt-4"
              >
                {getText("applayout.morebtn")}
              </div>
            )}
          </div>
          <div className="bg-cyan-800 flex items-center gap-2 border-t border-t-black/50 h-20 px-2">
            {!!user ? (
              <>
                <div className="min-w-[20px]">
                  <Image
                    src={user.picture}
                    alt={user.name}
                    height={20}
                    width={20}
                    className="rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-bold" style={{ wordBreak: "break-all" }}>
                    {user.email}
                  </div>
                  <Link className="text-sm" href="/api/auth/logout">
                    {getText("applayout.logout")}
                  </Link>
                </div>
              </>
            ) : (
              <Link href="/api/auth/login">{getText("applayout.login")}</Link>
            )}
          </div>
        </div>
        <div
          className="absolute top-16 -right-10 hamburger p-2 rounded cursor-pointer"
          onClick={() => setShowMenu((menu) => !menu)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
