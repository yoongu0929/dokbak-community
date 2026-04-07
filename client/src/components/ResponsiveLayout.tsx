import { ReactNode } from 'react';
import Header from './Header';
import styles from './ResponsiveLayout.module.css';

interface ResponsiveLayoutProps {
  children: ReactNode;
}

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.container}>
        {children}
      </div>
    </div>
  );
}
