import { EntitySchema } from "typeorm";

export const ExamenPractico = new EntitySchema({
  name: "ExamenPractico",
  tableName: "examenes_practicos",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    vehiculoId: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    fechaHoraInicio: {
      type: "timestamp",
      nullable: false,
    },
    fechaHoraFin: {
      type: "timestamp",
      nullable: false,
    },
    // Valores posibles son pendiente, aprobado, reprobado
    estado: {
      type: "varchar",
      length: 20,
      default: "pendiente",
    },
    observaciones: {
      type: "text",
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
    updated_at: {
      type: "timestamp",
      updateDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    alumno: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "alumnoId" },
      nullable: false,
      onDelete: "CASCADE",
    },
    instructor: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "instructorId" },
      nullable: false,
      onDelete: "CASCADE",
    },
  },
});
