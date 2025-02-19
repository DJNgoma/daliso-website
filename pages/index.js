import Image from "next/image";
import styles from "../styles/Home.module.css";

export default function Home() {
    return (
        <div className={styles.container}>
            {/* Header Section */}
            <header className={styles.header}>
                <h1>Daliso Ngoma</h1>
                <p className={styles.tagline}>
                    Entrepreneur | Technologist | Podcast Host
                </p>
            </header>

            {/* Profile Section */}
            <section className={styles.section}>
                <div className={styles.profileContainer}>
                    <Image
                        src="/profile.jpg"
                        alt="Daliso Ngoma"
                        width={120}
                        height={120}
                        className={styles.profilePicture}
                    />
                    <p className={styles.introText}>
                        Welcome to my personal website. I am a technology entrepreneur
                        focused on VR, AI, and digital experiences.
                    </p>
                </div>
            </section>

            {/* What I Do Section */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>What I Do</h2>
                <div className={styles.cardGrid}>
                    <div className={styles.card}>
                        <h3><strong>180by2 Store</strong></h3>
                        <p>Explore the best VR gear & tech accessories.</p>
                        <a
                            href="https://180by2.co.za"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.btn}
                        >
                            Visit Store
                        </a>
                    </div>

                    <div className={styles.card}>
                        <h3><strong>African Technopreneurs</strong></h3>
                        <p>Leading the charge in VR & tech solutions in Africa.</p>
                        <a
                            href="https://africantechno.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.btn}
                        >
                            Learn More
                        </a>
                    </div>

                    <div className={styles.card}>
                        <h3><strong>In It For The Tech</strong></h3>
                        <p>A podcast exploring tech innovations & entrepreneurship.</p>
                        <a
                            href="https://initforthetech.fm"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.btn}
                        >
                            Listen Now
                        </a>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Contact Me</h2>
                <p className={styles.contactText}>
                    Stay updated with my latest insights.
                </p>
                <a
                    href="https://x.com/djngoma"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btn}
                >
                    Follow Me on X
                </a>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <p>© 2025 Daliso Ngoma. All rights reserved.</p>
            </footer>
        </div>
    );
}
