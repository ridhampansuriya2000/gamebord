import { getSEO } from "../../utils/seo";

export const metadata = getSEO('sos');

export default function SOSLayout({ children }) {
  return children;
}
