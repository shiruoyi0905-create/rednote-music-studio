import Workbench from "@/components/Workbench";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function Home() {
  return (
    <ThemeProvider>
      <Workbench />
    </ThemeProvider>
  );
}
