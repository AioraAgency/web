import type { NextPage } from "next";
import Head from "next/head";
import { IntelligenceView } from "../views";
import Link from "next/link";

const Intel: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>AIORA Intel</title>
        <meta
          name="description"
          content="AIORA Intelligence Dashboard"
        />
      </Head>
      <IntelligenceView />
      <Link href="/intel">
        <div className="border border-white rounded-full px-6 py-3 md:px-8 md:py-4 text-lg md:text-2xl hover:bg-white/10 transition-colors cursor-pointer">
          Intel
        </div>
      </Link>
    </div>
  );
};

export default Intel; 