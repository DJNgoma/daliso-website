import Head from "next/head";
import { FaPodcast, FaCartShopping, FaVrCardboard, FaXTwitter } from "react-icons/fa6";

export default function Home() {
  return (
    <>
      <Head>
        <title>Daliso Ngoma</title>
      </Head>
      <div className="container">
        <h1>Daliso Ngoma</h1>
        <h2>Entrepreneur | Technologist | Podcast Host</h2>

        <div className="grid">
          {/* 180by2 Store */}
          <div className="section">
            <FaCartShopping className="icon store" />
            <h2>180by2 Store</h2>
            <p>Explore the best VR gear & tech accessories.</p>
            <a href="https://180by2.co.za" className="button">Visit Store</a>
          </div>

          {/* African Technopreneurs */}
          <div className="section">
            <FaVrCardboard className="icon vr" />
            <h2>African Technopreneurs</h2>
            <p>Leading the charge in VR & tech solutions in Africa.</p>
            <a href="https://africantechno.com" className="button">Learn More</a>
          </div>

          {/* Podcast */}
          <div className="section">
            <FaPodcast className="icon podcast" />
            <h2>In It For The Tech</h2>
            <p>A podcast exploring tech innovations & entrepreneurship.</p>
            <a href="https://www.initforthe.tech" className="button">Listen Now</a>
          </div>

          {/* Twitter (X) */}
          <div className="section">
            <FaXTwitter className="icon twitter" />
            <h2>Follow Me on X</h2>
            <p>Stay updated with my latest insights.</p>
            <a href="https://x.com/@djngoma" className="button">Follow</a>
          </div>
        </div>

        <div className="footer">
          <p>© {new Date().getFullYear()} Daliso Ngoma. All Rights Reserved.</p>
        </div>
      </div>
    </>
  );
}
