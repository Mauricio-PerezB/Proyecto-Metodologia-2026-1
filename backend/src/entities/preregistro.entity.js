import { EntitySchema } from "typeorm";

export const PreRegistro = new EntitySchema({
  name: "PreRegistro",
  tableName: "pre_registros",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    nombreCompleto: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    rut: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    telefono: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    fechaNacimiento: {
      type: "date",
      nullable: true,
    },
    sede: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    comprobantePagoUrl: {
      type: "varchar",
      length: 500,
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 20,
      default: "pendiente", // pendiente, aceptado, rechazado
    },
    motivoRechazo: {
      type: "varchar",
      length: 500,
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
    plan: {
      type: "many-to-one",
      target: "Plan",
      joinColumn: {
        name: "id_plan",
      },
    },
  },
});
