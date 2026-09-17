import { getSEO } from "../../utils/seo";

export const metadata = getSEO('bingo');

export default function BingoLayout({ children }) {
  return children;
}
