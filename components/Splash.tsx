import React from "react";
import { Book } from "lucide-react";
import Link from "next/link"; // Import Next.js Link
import { Button } from "./ui/button";

export const Splash: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 lg:gap-12 items-center max-w-full lg:max-w-3xl">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-balance text-left">
        Gym Bot
      </h1>

      <p className="text-primary-500 text-xl font-semibold leading-relaxed">
        {/* Add any description here */}
      </p>

      {/* Replaced navigate with Next.js Link */}
      <Button asChild>
        <Link href="/gym-log">My Gym Log</Link>
      </Button>

      <Button asChild>
        <Link href="/gym">Start a Gym Session</Link>
      </Button>

      <div className="h-[1px] bg-primary-300 w-full" />

      <footer className="flex flex-col lg:gap-2">
        <Button variant="light" asChild>
          <a
            href="https://github.com/daily-demos/daily-bots-web-demo"
            className="text-indigo-600"
          >
            <Book className="size-6" />
            Source code
          </a>
        </Button>
      </footer>
    </div>
  );
};

export default Splash;
