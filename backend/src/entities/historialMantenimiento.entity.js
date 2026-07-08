import { EntitySchema } from "typeorm";

export const HistorialMantenimiento = new EntitySchema({
  name: "HistorialMantenimiento",
  tableName: "historial_mantenimientos",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    fechaReporte: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
    kilometraje: {
      type: "int",
      nullable: false,
    },
    gravedad: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    descripcionFalla: {
      type: "text",
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 50,
      nullable: false,
      default: "Pendiente", // Pendiente, Resuelto
    },
    fechaResolucion: {
      type: "timestamp",
      nullable: true,
    },
    costoReparacion: {
      type: "int",
      nullable: true,
    },
    detalleReparacion: {
      type: "text",
      nullable: true,
    },
  },
  relations: {
    vehiculo: {
      target: "Vehiculo",
      type: "many-to-one",
      joinColumn: {
        name: "vehiculoId",
      },
      nullable: false,
      onDelete: "CASCADE",
    },
  },
});
