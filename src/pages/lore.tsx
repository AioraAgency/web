import type { NextPage } from "next";
import Head from "next/head";
import { LoreView } from "../views";

const Lore: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>AIORA Lore</title>
        <meta
          name="description"
          content="AIORA Lore and Background"
        />
      </Head>
      <LoreView />
    </div>
  );
};

export default Lore; 