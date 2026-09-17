import { getSEO } from "../../utils/seo";

export const metadata = getSEO('reverse');

export default function ReverseLayout({ children }) {
  return children;
}
