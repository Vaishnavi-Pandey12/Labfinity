import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ObservationsSection = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="font-display">Upload Observation Table</CardTitle>
        </CardHeader>
        <CardContent>
          <input type="file" className="w-full" />
        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="font-display">Upload Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <input type="file" className="w-full" />
        </CardContent>
      </Card>
    </div>
  );
};

export default ObservationsSection;
