import './globals.css';
import Sidebar from './components/Sidebar';

export const metadata = {
  title: 'ASA Student Portal',
  description: 'Agency Scaling Accelerator - Student Portal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
