import { useEffect } from "react";
import { Link, useParams, useRouteError } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { QUERY_KEYS } from "@/api/queryKeys";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const GameErrorPage = () => {
  const { uuid = "" } = useParams<{ uuid: string }>();
  const error = useRouteError();
  const qc = useQueryClient();

  useEffect(() => {
    return () => qc.removeQueries({ queryKey: QUERY_KEYS.games.one(uuid) });
  }, [qc, uuid]);

  const notFound =
    axios.isAxiosError(error) &&
    (error.response?.status === 404 || error.response?.status === 400);

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">
          {notFound ? "Game not found" : "Could not load the game"}
        </CardTitle>
        <CardDescription>
          {notFound
            ? "This game doesn't exist or you don't have access to it."
            : "Something went wrong. Try again later."}
        </CardDescription>
      </CardHeader>
      <CardFooter className="border-t">
        <Link
          to="/games"
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Back to games
        </Link>
      </CardFooter>
    </Card>
  );
};
