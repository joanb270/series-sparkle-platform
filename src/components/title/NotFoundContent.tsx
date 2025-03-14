
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFoundContent: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="main-container">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Contenido no encontrado</h2>
        <p className="text-muted-foreground mb-4">No pudimos encontrar el contenido que estás buscando.</p>
        <Button onClick={() => navigate("/")}>Volver al inicio</Button>
      </div>
    </div>
  );
};

export default NotFoundContent;
