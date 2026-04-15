import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="shell empty-card">
      <h1>Page not found</h1>
      <p>The route you requested does not exist in this storefront.</p>
      <Link className="primary-button inline" to="/">
        Back to Home
      </Link>
    </section>
  );
}
