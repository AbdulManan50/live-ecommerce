import { redirect } from "next/navigation";

export default function StreamRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/streams/${params.id}`);
}

