import { useJoinGame } from "@/api/hooks/useJoinGame";
import { useEffect } from "react";
import { useParams } from "react-router";

export const JoinGamePage = () => {
  const { uuid } = useParams<{ uuid: string }>();

  const joinGame = useJoinGame(uuid);

  useEffect(() => {
    joinGame.mutateAsync();
  }, []);

  return (
    <div>
      <div>Joining game...</div>
    </div>
  );
};
