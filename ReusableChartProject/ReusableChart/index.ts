import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import ChartApp from './ChartApp';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export class ReusableChart implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private container: HTMLDivElement;
    private context: ComponentFramework.Context<IInputs>;
    private root: Root;

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this.container = container;
        this.context = context;
        this.root = createRoot(this.container);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this.context = context;

        const chartType = (context.parameters.chartType.raw || "column").toLowerCase();
        const chartDataString = context.parameters.chartData.raw || '[]';

        let chartData: ChartData[] = []; 
        
        try {
            const parsedData = JSON.parse(chartDataString);
            
            if (Array.isArray(parsedData)) {
                chartData = parsedData;
            } else {
                chartData = [];
            }
        } catch (e) {
            console.error("Invalid JSON data provided to chart component:", e);
            chartData = [];
        }

        this.root.render(
            React.createElement(ChartApp, { 
                chartType: chartType, 
                data: chartData
            })
        );
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        this.root.unmount();
    }
}

