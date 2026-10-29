import { Fragment } from "react";

/** A URL that wraps after its hyphens and before its dots and slashes, never mid-word. */
export function UrlText({ url }: { url: string }) {
  return url.split(/(?<=-)|(?=[./])/).map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <wbr />}
      {part}
    </Fragment>
  ));
}
