import ClassroomDashboard from "./ClassroomDashboard";

const Classroom = () => {
  // Temporary debug log to confirm the /classroom route renders this page.
  console.log("[routing] /classroom matched: rendering Classroom");
  return <ClassroomDashboard />;
};

export default Classroom;
