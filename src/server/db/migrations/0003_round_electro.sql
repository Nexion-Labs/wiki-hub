ALTER TABLE "eol_products" DROP CONSTRAINT "eol_products_product_type_eol_categories_code_fk";
--> statement-breakpoint
DROP INDEX "idx_eol_products_type";--> statement-breakpoint
ALTER TABLE "eol_products" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "eol_products" ADD CONSTRAINT "eol_products_category_id_eol_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."eol_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_eol_products_category" ON "eol_products" USING btree ("category_id");--> statement-breakpoint
ALTER TABLE "eol_products" DROP COLUMN "product_type";