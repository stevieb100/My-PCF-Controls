# Personal Projects - PCF Monorepo

This repository contains multiple Power Apps Component Framework (PCF) controls.

## Current Projects

| Project Name | Path | Namespace | Description |
| :--- | :--- | :--- | :--- |
| **MultiSelectLookup** | `./MultiSelectLookup` | `pcf` | Multi-select combobox storing data as semicolon-separated text. |
| **ReusableChartProject** | `./ReusableChartProject` | `formus` | Renders dynamic Column or Bar charts based on JSON data string. |

---

## How to Add a New PCF Control

To add a 3rd or 4th control to this repository, follow this exact workflow:

### 1. Create and Init

Open Terminal in the root `Personal Projects` folder:

```bash
mkdir MyNewControl
cd MyNewControl
pac pcf init --namespace UI --name MyNewControl --template field
```

### 2. Install Dependencies (The Safe Way)

We use **React 17** to ensure compatibility with the PCF harness. Do **not** just run `npm install react` or it will install React 18/19 and break the build.

```bash
npm install
npm install react@17.0.2 react-dom@17.0.2
npm install @fluentui/react
npm install --save-dev @types/react@17 @types/react-dom@17
```

### 3. Configure Manifest

Update `ControlManifest.Input.xml`:

* Change `namespace` to `UI` (or your preferred namespace).
* Add `<feature-usage><uses-feature name="WebAPI" required="true" /></feature-usage>` if you need data access.
* Add `<resx path="strings/MyNewControl.1033.resx" version="1.0.0" />` for friendly names.

### 4. Git Workflow

Since the root is already a Git repo, just add the new folder:

```bash
cd ..
git add .
git commit -m "Added MyNewControl"
git push
```

---

## Deployment Commands

### Quick Deploy (Dev Environment)

Use this to push the code directly to the environment for testing.

```bash
cd MyNewControl
npm run build
pac pcf push --publisher-prefix formus
```

### Generate Solution (Managed/Unmanaged Zip)

If you need to generate a solution file to import into another environment:

1. **Create a solution folder sibling to your control:**
    ```bash
    cd ..
    mkdir MyNewControlSolution
    cd MyNewControlSolution
    pac solution init --publisher-name formus --publisher-prefix formus
    ```

2. **Link the control:**
    ```bash
    pac solution add-reference --path ..\MyNewControl
    ```

3. **Update Versions (Crucial):**
    * **Control Version:** Update `ControlManifest.Input.xml` in the control folder.
      ```xml
      <control ... version="1.0.1" ...>
      ```
    * **Solution Version:** Update `src/Solution.xml` in the solution folder.
      ```xml
      <ImportExportXml ... SolutionPackageVersion="1.0.1.0">
      ```

4. **Configure for Dual Output (Managed & Unmanaged):**
    * Open the `MyNewControlSolution.cdsproj` file.
    * Add this block inside the `<Project>` tag (e.g., after the other PropertyGroups):
    ```xml
    <PropertyGroup>
      <SolutionPackageType>Both</SolutionPackageType>
      <SolutionPackageEnableLocalization>false</SolutionPackageEnableLocalization>
    </PropertyGroup>
    ```

5. **Build:**
    ```bash
    dotnet build
    ```
    *Outputs located in: `bin/Debug` (contains both Managed and Unmanaged zips)*

---

## Troubleshooting

### Error: `ReactDOM.render is not a function`

* **Cause:** You installed React 18+ but the code uses React 17 syntax.
* **Fix:** Run `npm install react@17.0.2 react-dom@17.0.2`.

### Error: `WebAPI.retrieveMultipleRecords is required`

* **Cause:** You used `context.webAPI` in code but didn't declare it in the manifest.
* **Fix:** Add this to `ControlManifest.Input.xml` inside the `<control>` tag:
    ```xml
    <feature-usage>
      <uses-feature name="WebAPI" required="true" />
    </feature-usage>
    ```