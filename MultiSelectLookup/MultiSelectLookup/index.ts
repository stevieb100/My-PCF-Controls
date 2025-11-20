import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { MultiSelectComponent, IMultiSelectProps } from "./MultiSelectComponent";

export class MultiSelectLookup implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _notifyOutputChanged: () => void;
    private _container: HTMLDivElement;
    private _currentValue: string | null;
    private _props: IMultiSelectProps;

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this._notifyOutputChanged = notifyOutputChanged;
        this._container = container;
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Read the raw string from the text field (e.g. "Apple; Banana")
        this._currentValue = context.parameters.boundTextField.raw;

        // Prepare the properties to send to React
        this._props = {
            webApi: context.webAPI,
            targetEntity: context.parameters.targetEntity.raw || "",
            displayColumn: context.parameters.displayColumn.raw || "",
            sortColumn: context.parameters.sortColumn.raw || undefined,
            currentValue: this._currentValue,
            isDisabled: context.mode.isControlDisabled,
            onChange: this.onChange.bind(this)
        };

        // Render the React Component into the container
        ReactDOM.render(
            React.createElement(MultiSelectComponent, this._props),
            this._container
        );
    }

    private onChange(newValue: string): void {
        this._currentValue = newValue;
        this._notifyOutputChanged();
    }

    public getOutputs(): IOutputs {
        return {
            boundTextField: this._currentValue || undefined
        };
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this._container);
    }
}