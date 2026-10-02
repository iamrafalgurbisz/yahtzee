import type React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props extends React.ComponentProps<"input"> {
  name: string;
  label: string;
}

export const FormField: React.FC<Props> = ({ name, label, ...props }) => {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...props} />
    </div>
  );
};
