import { useState } from "react";
import { createProject } from "../services/contractServices";
import { Button, Card, CardContent, TextField, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const CreateProject = ({ updateBalance }: { updateBalance: () => void }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");

  const handleCreateProject = async () => {
    if (!title || !description || !goal) {
      alert("Please fill out all fields.");
      return;
    }

    await createProject(title, description, parseFloat(goal));
    setTitle("");
    setDescription("");
    setGoal("");
    updateBalance();
  };

  const projectCount = useSelector((state: RootState) => Object.keys(state.projects.projects).length);

  return (
    <Card sx={{ maxWidth: 600, margin: "auto", marginTop: 4, padding: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Create a Project
        </Typography>
        <TextField
          label="Project Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Project Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />
        <TextField
          label="Goal Amount (ETH)"
          value={goal}
          onChange={(e) => {
            const value = Math.max(0, Number(e.target.value));
            setGoal(value.toString());
          }}
          type="number"
          fullWidth
          margin="normal"
          inputProps={{ min: 0 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateProject}
          fullWidth
          sx={{ marginTop: 2 }}
        >
          Create Project
        </Button>

        <Typography variant="h6" mt={3}>
          Total Projects: {projectCount}
        </Typography>

      </CardContent>
    </Card>
  );
};

export default CreateProject;
