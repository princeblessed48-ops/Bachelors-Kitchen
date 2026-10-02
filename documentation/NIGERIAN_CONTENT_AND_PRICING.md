# Nigerian Content and Price Management

## Starter content

The default seed loads 20 everyday Nigerian meals, detailed cooking steps and a complete timetable for the current month. Saturdays are used for occasional try-something-different meals. The plan remains editable by administrators.

Run from `backend/` with `npm run seed`. The seed script resets its application collections before loading sample records. Use it only with a development database.

Sample accounts:

- Admin: `admin@bachelorkitchen.com` / `admin123`
- Free member: `free@bachelorkitchen.com` / `free123`
- Subscriber: `subscriber@bachelorkitchen.com` / `subscriber123`

Replace these credentials and use a non-production database before deployment.

## Estimated prices

Meal estimates are stored on each meal in MongoDB, not in React components. Ingredient-price records include name, unit, quantity, NGN price, city/area, market, and effective date. An administrator can manage records in the dashboard or through:

- `GET /api/admin/ingredient-prices`
- `POST /api/admin/ingredient-prices`
- `PATCH /api/admin/ingredient-prices/:id`

The starter prices are illustrative sample estimates, not a live market feed or guaranteed current prices. Admins should confirm local market rates and update them regularly. Meal ingredient-cost lines and meal estimates should then be reviewed and saved through meal management. Prices can vary by location, season, vendor, quantity and brand.

## Photo credits

The seeded photos are sourced from Wikimedia Commons. Check the linked file pages for creator attribution and the current reuse license before redistributing images:

- [Nigerian Jollof rice](https://commons.wikimedia.org/wiki/File:Nigerian_jollof_rice.jpg)
- [Beans and plantain](https://commons.wikimedia.org/wiki/File:Beans_and_plantain_(African_good).jpg)
- [Nigerian yam and egg sauce](https://commons.wikimedia.org/wiki/File:Nigerian_dish_Yam_and_Egg_Sauce.jpg)
- [Akara / Kosai](https://commons.wikimedia.org/wiki/File:Kosai(Akara).jpg)
- [Moi Moi](https://commons.wikimedia.org/wiki/File:Moin_Moin.jpg)
- [Ofada Ayamase stew](https://commons.wikimedia.org/wiki/File:Ofada_Stew_(Ayamase_stew).jpg)
- [Nigerian fried rice with chicken](https://commons.wikimedia.org/wiki/File:Fried_rice_and_chicken_garnished_with_sweet_corn,_carrot_and_green_peas.jpg)
- [Yam porridge / Asaro](https://commons.wikimedia.org/wiki/File:Yam_porridge_or_%C3%80s%C3%A1r%C3%B3.jpg)
- [Nigerian pepper soup](https://commons.wikimedia.org/wiki/File:Nigerian_prepared_Pepper-Soup.jpg)
