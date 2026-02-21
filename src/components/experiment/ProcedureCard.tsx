import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks } from "lucide-react";

interface Step {
  title: string;
  content: string;
}

interface ProcedureCardProps {
  steps: Step[];
}

const ProcedureCard = ({ steps }: ProcedureCardProps) => {
  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-display">
          <ListChecks className="w-5 h-5 text-primary" />
          Procedure
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {steps.map((step, index) => (
            <AccordionItem key={index} value={`step${index}`}>
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  {step.title}
                </span>
              </AccordionTrigger>

              <AccordionContent className="text-muted-foreground pl-11">
                {step.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ProcedureCard;
