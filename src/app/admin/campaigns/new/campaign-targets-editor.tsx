"use client";

import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  campaignType: "MANAGER_LINKS" | "SERVICE_UNIQUE";
  currentManager: string;
  setCurrentManager: (value: string) => void;
  managers: string[];
  onAddManager: () => void;
  onRemoveManager: (value: string) => void;
  currentService: string;
  setCurrentService: (value: string) => void;
  services: string[];
  onAddService: () => void;
  onRemoveService: (value: string) => void;
};

function SegmentList({
  values,
  onRemove,
}: {
  values: string[];
  onRemove: (value: string) => void;
}) {
  if (values.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="max-h-48 w-full">
      <div className="flex flex-wrap gap-3 p-1">
        {values.map((value) => (
          <Badge
            key={value}
            variant="secondary"
            className="bg-slate-700 py-1 px-3 text-base text-slate-200"
          >
            {value}
            <button
              type="button"
              onClick={() => onRemove(value)}
              className="ml-2 rounded-full p-0.5 hover:bg-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </ScrollArea>
  );
}

export function CampaignTargetsEditor(props: Props) {
  const isManager = props.campaignType === "MANAGER_LINKS";
  const values = isManager ? props.managers : props.services;
  const currentValue = isManager ? props.currentManager : props.currentService;
  const placeholder = isManager ? "Ajouter un manager" : "Ajouter un service";

  return (
    <>
      <div className="flex gap-2">
        <Input
          value={currentValue}
          onChange={(event) =>
            isManager
              ? props.setCurrentManager(event.target.value)
              : props.setCurrentService(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key !== "Enter") {
              return;
            }
            event.preventDefault();
            if (isManager) {
              props.onAddManager();
              return;
            }
            props.onAddService();
          }}
          placeholder={placeholder}
          className="h-12 border-slate-700 bg-slate-800 text-lg text-white placeholder:text-slate-400"
        />
        <Button
          type="button"
          size="icon"
          className="h-12 w-12 flex-shrink-0"
          onClick={isManager ? props.onAddManager : props.onAddService}
          disabled={!currentValue.trim()}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <SegmentList
        values={values}
        onRemove={isManager ? props.onRemoveManager : props.onRemoveService}
      />
    </>
  );
}
