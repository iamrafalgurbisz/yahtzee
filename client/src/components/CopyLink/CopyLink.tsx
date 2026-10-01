import { useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { toast } from "@/components/ui/toast";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.add({ title: "Link copied", type: "success" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.add({ title: "Couldn't copy the link", type: "error" });
    }
  };

  return (
    <InputGroup>
      <InputGroupInput
        value={url}
        readOnly
        onFocus={(e) => e.currentTarget.select()}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          onClick={onCopy}
          aria-label="Copy link"
        >
          {copied ? <Check /> : <Copy />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
