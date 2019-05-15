# sabemos-un-poco

Explore data related to 400k+ immigration bond determinations while we build out Sabemos (mucho)!

## Prerequisites

You must have Git, Node, Docker, and Yarn installed on your machine to run this program as described below.

## To Run

Clone this repository to your local machine.

```bash
git clone git@github.com:fabulascode/sabemos-un-poco.git
```

Change into the newly created directory and install dependencies

```bash
cd sabemos-un-poco && yarn
```

Start up the backend resources:

```bash
docker-compose up -d
```

Begin the data migration:

```bash
yarn dev
```
