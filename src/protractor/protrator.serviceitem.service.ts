import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";
type ProtractorServiceItem = {
  Header: {
    ID: string;
    CreationTime: Date | null;
    DeletionTime: Date | null;
    LastModifiedTime: Date | null;
    LastModifiedBy: string | null;
  };
  ID: string;
  Type: string | null;
  Lookup: string | null;
  Description: string | null;
  Usage: number | null;
  ProductionDate: Date | null;
  Note: string | null;
  NoEmail: boolean | null;
  NoPostCard: boolean | null;
  OwnerID: string | null;
  PlateRegistration: string | null;
  VIN: string | null;
  Unit: string | null;
  Color: string | null;
  Year: number | null;
  Make: string | null;
  Model: string | null;
  Submodel: string | null;
  Engine: string | null;
};

@Injectable()
export class ProtractorServiceItemService {
  constructor(@Inject("DB_CONNECTION") private readonly db: Pool) {}

  async writeProtractorServiceItemsToDB(
    protractorServiceItem: ProtractorServiceItem[],
  ) {
    console.log(protractorServiceItem);
    const serviceitems = protractorServiceItem.reduce(
      (result, serviceitem) => ({
        ids: [...result.ids, serviceitem.ID],
        types: [...result.types, serviceitem.Type],
        lookups: [...result.lookups, serviceitem.Lookup],
        descriptions: [...result.descriptions, serviceitem.Description],
        usages: [...result.usages, serviceitem.Usage],
        productiondates: [
          ...result.productiondates,
          serviceitem.ProductionDate,
        ],
        notes: [...result.notes, serviceitem.Note],
        noemails: [...result.noemails, serviceitem.NoEmail],
        nopostcards: [...result.nopostcards, serviceitem.NoPostCard],
        ownerids: [...result.ownerids, serviceitem.OwnerID],
        plateregistrations: [
          ...result.plateregistrations,
          serviceitem.PlateRegistration,
        ],
        vins: [...result.vins, serviceitem.VIN],
        units: [...result.units, serviceitem.Unit],
        colors: [...result.colors, serviceitem.Color],
        years: [...result.years, serviceitem.Year],
        makes: [...result.makes, serviceitem.Make],
        models: [...result.models, serviceitem.Model],
        submodels: [...result.submodels, serviceitem.Submodel],
        engines: [...result.engines, serviceitem.Engine],
      }),
      {
        ids: [] as string[],
        types: [] as (string | null)[],
        lookups: [] as (string | null)[],
        descriptions: [] as (string | null)[],
        usages: [] as (number | null)[],
        productiondates: [] as (Date | null)[],
        notes: [] as (string | null)[],
        noemails: [] as (boolean | null)[],
        nopostcards: [] as (boolean | null)[],
        ownerids: [] as (string | null)[],
        plateregistrations: [] as (string | null)[],
        vins: [] as (string | null)[],
        units: [] as (string | null)[],
        colors: [] as (string | null)[],
        years: [] as (number | null)[],
        makes: [] as (string | null)[],
        models: [] as (string | null)[],
        submodels: [] as (string | null)[],
        engines: [] as (string | null)[],
      },
    );

    await this.db.query(
      `
        INSERT INTO protractorserviceitem (
            id,
            type,
            lookup,
            description,
            usage,
            productiondate,
            note,
            noemail,
            nopostcard,
            ownerid,
            plateregistration,
            vin,
            unit,
            color,
            year,
            make,
            model,
            submodel,
            engine
        )
        SELECT * FROM UNNEST (
            $1::varchar[],
            $2::varchar[],
            $3::varchar[],
            $4::varchar[],
            $5::int[],
            $6::timestamp[],
            $7::text[],
            $8::boolean[],
            $9::boolean[],
            $10::varchar[],
            $11::varchar[],
            $12::varchar[],
            $13::varchar[],
            $14::varchar[],
            $15::int[],
            $16::varchar[],
            $17::varchar[],
            $18::varchar[],
            $19::varchar[]
        )
        ON CONFLICT (id)
        DO UPDATE
        SET
        id = EXCLUDED.id,
        type = EXCLUDED.type,
        lookup = EXCLUDED.lookup,
        description = EXCLUDED.description,
        usage = EXCLUDED.usage,
        productiondate = EXCLUDED.productiondate,
        note = EXCLUDED.note,
        noemail = EXCLUDED.noemail,
        nopostcard = EXCLUDED.nopostcard,
        ownerid = EXCLUDED.ownerid,
        plateregistration = EXCLUDED.plateregistration,
        vin = EXCLUDED.vin,
        unit = EXCLUDED.unit,
        color = EXCLUDED.color,
        year = EXCLUDED.year,
        make = EXCLUDED.make,
        model = EXCLUDED.model,
        submodel = EXCLUDED.submodel,
        engine = EXCLUDED.engine`,
      [
        serviceitems.ids,
        serviceitems.types,
        serviceitems.lookups,
        serviceitems.descriptions,
        serviceitems.usages,
        serviceitems.productiondates,
        serviceitems.notes,
        serviceitems.noemails,
        serviceitems.nopostcards,
        serviceitems.ownerids,
        serviceitems.plateregistrations,
        serviceitems.vins,
        serviceitems.units,
        serviceitems.colors,
        serviceitems.years,
        serviceitems.makes,
        serviceitems.models,
        serviceitems.submodels,
        serviceitems.engines,
      ],
    );
  }
}
