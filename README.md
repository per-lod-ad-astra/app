# Per LOD ad Astra - Term alignment

Deze tool werd gemaakt in het kader van de 2023 Hack-a-LOD in Gouda.

Let op: dit is geen production-grade software!!

# Installatie

Plaats de code in een webserver met Php support. De applicatie zelf wordt vrijwel volledig in de browser gedraait, alleen het opslaan van de gegenereerde triples vergt een Php script.

De bronnen waarin gezocht kan worden zijn afkomstog uit het [NDE Termennetwerk](https://termennetwerk.netwerkdigitaalerfgoed.nl). Daarnaast is het mogelijk om eigen bronnen te definiëren.

## Docker
Het is mogelijk om de app met Docker te starten via http://localhost:3000:
```bash
docker build -t per-lod-ad-astra
docker run -p 3000:80 -d --name per-lod-ad-astra per-lod-ad-astra
```

## Eigen bronnen toevoegen
Eigen bronnen kunnen worden toegevoegd door een SPARQL query te maken die `https://schema.org/about`en `https://schema.org.name` properties teruggeeft d.m.v. een `construct` query. Ook moet er een `?zoekopdracht` variabele aanwezig zijn. De query moet geplaatst worden in de folder `sparql-queries`. Daarnaast moet de query worden geregistreerd in het bestand `sparql-queries/per-lod-ad-astra.sources`. Bekijk de voorbeelden in `sparql-queries` hoe e.e.a. werkt. 

# Gegenereerde triples
De triples die gegenereerd worden met deze tool worden opgeslagen in de map `relaties`. Let op dat deze folder schrijfrechten moet hebben voor de webserver, op Linux/MacOS doe je dat door het commando `chmod a+rwx relaties` te typen. **Let op** hiermee geef je dus schrijfrechten op een folder op je webserver!

# Ontwikkelaars
Voor lokale ontwikkeling start je een development webserver met `http://127.0.0.1:3000`.

