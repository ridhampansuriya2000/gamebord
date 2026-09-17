import { getSEO } from "../../utils/seo";

export const metadata = getSEO('tictactoe');

export default function TicTacToeLayout({ children }) {
  return children;
}
