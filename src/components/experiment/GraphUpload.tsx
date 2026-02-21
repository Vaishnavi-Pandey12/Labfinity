import { useEffect, useState } from "react";

interface GraphUploadProps {
  studentId: string;
  experimentId: string;
  onUploadSuccess: () => void;
}

const GraphUpload = ({
  studentId,
  experimentId,
  onUploadSuccess,
}: GraphUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch previously uploaded graph on mount
  useEffect(() => {
    const fetchExistingUpload = async () => {
      try {
        const response = await fetch(
          `/api/uploads/${studentId}/${experimentId}`
        );

        if (!response.ok) return;

        const data = await response.json();

        if (data.fileUrl) {
          setImageUrl(data.fileUrl);
          onUploadSuccess(); // mark tab complete
        }
      } catch (error) {
        console.error("Error fetching upload:", error);
      }
    };

    fetchExistingUpload();
  }, [studentId, experimentId, onUploadSuccess]);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    // ✅ Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("studentId", studentId);
    formData.append("experimentId", experimentId);

    try {
      setLoading(true);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      if (data.fileUrl) {
        setImageUrl(data.fileUrl);
        onUploadSuccess();
        alert("Upload successful!");
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={(e) => {
          if (e.target.files) {
            setFile(e.target.files[0]);
          }
        }}
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {imageUrl && (
        <div>
          <p className="font-medium">Uploaded Graph:</p>
          <img
            src={imageUrl}
            alt="Uploaded Graph"
            className="w-80 rounded shadow mt-2"
          />
        </div>
      )}
    </div>
  );
};

export default GraphUpload;
