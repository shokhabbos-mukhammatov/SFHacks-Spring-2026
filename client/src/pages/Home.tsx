import { Link } from 'react-router-dom';
import styles from './Home.module.css';

export default function Home() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>🚀 SFHacks Spring 2026</h1>
      <p className={styles.subtitle}>Your hackathon project is ready to build!</p>
      <ul className={styles.links}>
        <li>
          <Link to="/api/health" target="_blank" rel="noopener noreferrer">
            API Health Check
          </Link>
        </li>
        <li>
          <a
            href="https://github.com/shokhabbos-mukhammatov/SFHacks-Spring-2026"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Repository
          </a>
        </li>
      </ul>
    </main>
  );
}
