import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Daliso Ngoma</title>
                <meta name="description" content="Daliso Ngoma | Entrepreneur | Technologist | Podcast Host" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* Header Section */}
            <header className={styles.header}>
                <h1>Daliso Ngoma</h1>
                <p className={styles.tagline}>Entrepreneur | Technologist | Podcast Host</p>
            </header>

            {/* Profile Section */}
            <section className={styles.section}>
                <div className={styles.profileContainer}>
                    <Image src="/profile.jpg" alt="Daliso Ngoma" width={130} height={130} className={styles.profilePicture} />
                    <p className={styles.introText}>
                        Welcome to my personal website. I am a technology entrepreneur focused on VR, AI, and digital experiences.
                    </p>
                </div>
            </section>

            {/* What I Do Section */}
            <section className={styles.section}>
                <h2 style={{ textAlign: 'center' }}>What I Do</h2>
                <div className={styles.cardGrid}>
                    <div className={styles.card}>
                        <h3><strong>180by2 Store</strong></h3>
                        <p>Explore the best VR gear & tech accessories.</p>
                        <a href="https://180by2.co.za" className={styles.btn} target="_blank" rel="noopener noreferrer">
                            Visit Store
                        </a>
                    </div>
                    <div className={styles.card}>
                        <h3><strong>African Technopreneurs</strong></h3>
                        <p>Leading the charge in VR & tech solutions in Africa.</p>
                        <a href="https://africantechno.com" className={styles.btn} target="_blank" rel="noopener noreferrer">
                            Learn More
                        </a>
                    </div>
                    <div className={styles.card}>
                        <h3><strong>In It For The Tech</strong></h3>
                        <p>A podcast exploring tech innovations & entrepreneurship.</p>
                        <a href="https://linktr.ee/dalisongoma" className={styles.btn} target="_blank" rel="noopener noreferrer">
                            Listen Now
                        </a>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className={styles.section}>
                <h2 style={{ textAlign: 'center' }}>Contact Me</h2>
                <p className={styles.contactText}>Stay updated with my latest insights.</p>
                <div style={{ textAlign: 'center' }}>
                    <a href="https://twitter.com/dalisongoma" className={styles.btn} target="_blank" rel="noopener noreferrer">
                        Follow Me on X
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <p>© 2025 Daliso Ngoma. All rights reserved.</p>
            </footer>
        </div>
    );
}
