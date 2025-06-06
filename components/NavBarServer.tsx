import { NextPage } from "next";
import Navbar from "./navBar";
import { hasEnvVars } from "@/lib/utils";

interface Props {}

const NavBarServer: NextPage<Props> = ({}) => {
  return (
    <div>
      <Navbar hasEnvVars={hasEnvVars} />
    </div>
  );
};

export default NavBarServer;
