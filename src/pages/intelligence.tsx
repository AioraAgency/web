import type { NextPage } from "next";
import Head from "next/head";
import { IntelligenceView } from "../views";

const Intelligence: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>AIORA Intelligence</title>
        <meta
          name="description"
          content="AIORA Intelligence Dashboard"
        />
      </Head>
      <IntelligenceView />
    </div>
  );
};

export default Intelligence; 