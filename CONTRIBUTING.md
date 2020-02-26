# Contributing to Our Projects

Thanks for thinking about using or contributing to this software ("Project") and its documentation!

* [Policy & Legal Info](#policy)
* [Getting Started](#getting-started)
* [Submitting an Issue](#submitting-an-issue)
* [Submitting Code](#submitting-code)

## Policy

### 1. Introduction

The project maintainer for this Project will only accept contributions using the Developer's Certificate of Origin 1.1 located at [developercertificate.org](https://developercertificate.org) ("DCO"). The DCO is a legally binding statement asserting that you are the creator of your contribution, or that you otherwise have the authority to distribute the contribution, and that you are intentionally making the contribution available under the license associated with the Project ("License").

### 2. Developer Certificate of Origin Process

Before submitting contributing code to this repository for the first time, you'll need to sign a Developer Certificate of Origin (DCO) (see below). To agree to the DCO, add your name and email address to the [CONTRIBUTORS.md](https://github.com/Code-dot-mil/code.mil/blob/master/CONTRIBUTORS.md) file. At a high level, adding your information to this file tells us that you have the right to submit the work you're contributing and indicates that you consent to our treating the contribution in a way consistent with the license associated with this software (as described in [LICENSE.md](https://github.com/Code-dot-mil/code.mil/blob/master/LICENSE.md)) and its documentation ("Project").

### 3. Important Points

Pseudonymous or anonymous contributions are permissible, but you must be reachable at the email address provided in the Signed-off-by line.

If your contribution is significant, you are also welcome to add your name and copyright date to the source file header.

U.S. Federal law prevents the government from accepting gratuitous services unless certain conditions are met. By submitting a pull request, you acknowledge that your services are offered without expectation of payment and that you expressly waive any future pay claims against the U.S. Federal government related to your contribution.

If you are a U.S. Federal government employee and use a `*.mil` or `*.gov` email address, we interpret your Signed-off-by to mean that the contribution was created in whole or in part by you and that your contribution is not subject to copyright protections.

### 4. DCO Text

The full text of the DCO is included below and is available online at [developercertificate.org](https://developercertificate.org):

```txt
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.
1 Letterman Drive
Suite D4700
San Francisco, CA, 94129

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.

Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

## Getting Started

System for Operational Logistics Ordering (SOLO) is a companion software application for the Receipt of Goods workflow inside of the Global Combat Support System - Marine Corps (GCSS-MC). SOLO uses the [Django](https://www.djangoproject.com/) web framework written primarily in the [Python 3](https://www.python.org/download/releases/3.0/) programming language for backend services and [React](https://reactjs.org/) using [TypeScript](https://www.typescriptlang.org/) for frontend services.

### Making Changes

Now you're ready to [clone the repository](https://github.com/deptofdefense/solo) locally and start making changes. The website's source code is in the `root` folder which contains content pages authored in the [Markdown text format](https://www.markdownguide.org/).

### Running the development environment

#### HTTP only for development
A docker-compose.yml file is included in the repository that quickly and easily allows the execution of the entire system for rapid local development. (all commands are specified from the `deploy/compose` directory):
  1. Copy the example environment file to a new file called `.env`
      -  `cp .env.example .env`
 
  2. Edit the `.env` file and create a username and password for the database connection.
      - Note these values will only apply to your local environment
  3. Execute `docker-compose up --build`
  4. After the build process, navigate to `http://localhost:3000` in a browswer
      - Note that hot reloading is enabled for changes to front and backend source files

#### Local HTTPS environment
  1. After setting up the http environment, Navigate to solo/deploy/compose, make configureLocalEnv.sh executable, and run the script, set the Country name to US when prompted, skip the rest.
      - `chmod +x configureLocalEnv.sh`
      - `sudo sh configureLocalEnv.sh`
      - `US` -> `ENTER` x6
  2. Execute docker-compose
      - `docker-compose -f docker-compose.yml up --build`
  3. Tell Chrome to allow self-signed certificates on localhost
      - Navigate to `chrome://flags/#allow-insecure-localhost` and enable that setting
  4. After the build process, navigate to `https://stage.solo.localhost` in a browser
      - Note that hot reloading is disabled

### Code Style

Your bug fix or feature addition won't be rejected if it runs afoul of any (or all) of these guidelines, but following the guidelines will definitely make everyone's lives a little easier.

## Submitting an Issue

You should feel free to [submit an issue](https://github.com/deptofdefense/solo/issues) on our GitHub repository for anything you find that needs attention on the website. That includes content, functionality, design, or anything else!

### Submitting a Bug Report

When submitting a bug report on the website, please be sure to include accurate and thorough information about the problem you're observing. Be sure to include:

* Steps to reproduce the problem,
* The URL of the page where you observed the problem,
* What you expected to happen,
* What actually happend (or didn't happen), and
* Technical details including your Operating System name and version and Web browser name and version number.

## Submitting Code

When making your changes, it is highly encouraged that you use a [branch in Git](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging), then submit a [pull request](https://github.com/deptofdefense/solo/pulls) (PR) on GitHub.

After review by the SOLO team, your PR will either be commented on with a request for more information or changes, or it will be merged into the `master` branch and deployed to a URL for testing purposes.

Assuming everything checks out, the SOLO team will merge the `staging` branch into the `production` branch which will be automatically deployed to the production hosting environment.

### Check Your Changes

Before submitting your pull request, you should run the build process locally first to ensure things are working as expected.

#### pre-commit hook

A hook is included in the repository that should be configured prior to making any commits to help with this process. It ensures that any changes to be committed comply with the acceptance criteria within the CI/CD pipeline. At minimum, the hook will run unit tests, fix and check code-style, and lint. To use this hook, run the following command from the root of the repository.

`ln -s -f ../../hooks/precommit.sh .git/hooks/pre-commit`

In order to prevent the pre-commit verification from running, add the --no-verify flag.

`git commit --no-verify -m "..."`
