import { SimplePage } from "@/components/site-chrome";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <SimplePage>
      <h1 className="text-h2 font-bold">Deze pagina bestaat niet</h1>
      <p className="mt-4 text-lead text-fg-muted">
        Misschien is de link oud of zit er een typfout in. Op de homepage vind je alles terug.
      </p>
      <ButtonLink href="/" className="mt-8">
        Naar de homepage
      </ButtonLink>
    </SimplePage>
  );
}
