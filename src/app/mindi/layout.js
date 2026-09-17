import { getSEO } from "../../utils/seo";

export const metadata = getSEO('mindi');

export default function MindiLayout({ children }) {
  return children;
}
