import * as React from 'react';
import { ComboBox, IComboBox, IComboBoxOption, IComboBoxStyles } from '@fluentui/react/lib/ComboBox';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { Stack, MessageBar, MessageBarType } from '@fluentui/react';

export interface IMultiSelectProps {
    webApi: ComponentFramework.WebApi;
    targetEntity: string;
    displayColumn: string;
    sortColumn?: string;
    currentValue: string | null;
    onChange: (newValue: string) => void;
    isDisabled: boolean;
}

export const MultiSelectComponent: React.FC<IMultiSelectProps> = (props) => {
    const [loadedOptions, setLoadedOptions] = React.useState<IComboBoxOption[]>([]);
    const [finalOptions, setFinalOptions] = React.useState<IComboBoxOption[]>([]);
    const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    // New state for error handling
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchRecords = async () => {
            // Reset error
            setErrorMessage(null);
            setLoading(true);

            if (!props.targetEntity || !props.displayColumn) {
                setErrorMessage("Configuration Error: Target Entity or Display Column is empty.");
                setLoading(false);
                return;
            }

            try {
                // Added try/catch around ID generation
                const entityIdField = `${props.targetEntity}id`;

                const select = `?$select=${props.displayColumn},${entityIdField}`;
                const filter = `&$filter=statecode eq 0`;
                const order = props.sortColumn ? `&$orderby=${props.sortColumn} asc` : '';

                console.log(`MultiSelectLookup: Fetching from ${props.targetEntity} with query: ${select}${filter}${order}`);

                const result = await props.webApi.retrieveMultipleRecords(props.targetEntity, select + filter + order);

                if (result.entities.length === 0) {
                    console.warn("MultiSelectLookup: Query returned 0 records.");
                }

                const mappedOptions: IComboBoxOption[] = result.entities.map(entity => ({
                    key: entity[entityIdField],
                    text: entity[props.displayColumn]
                }));

                setLoadedOptions(mappedOptions);
                setLoading(false);
            } catch (error) {
                console.error("MultiSelectLookup Error:", error);
                const msg = error instanceof Error ? error.message : "Check console for details";
                setErrorMessage(`Error fetching data: ${msg}`);
                setLoading(false);
            }
        };

        fetchRecords();
    }, [props.targetEntity, props.displayColumn, props.sortColumn]);

    React.useEffect(() => {
        if (!loading) {
            let currentSavedNames: string[] = [];

            if (props.currentValue) {
                currentSavedNames = props.currentValue.split(';').map(s => s.trim()).filter(s => s !== "");
            }

            const newSelectedKeys: string[] = [];
            const ghostOptions: IComboBoxOption[] = [];

            currentSavedNames.forEach(name => {
                const match = loadedOptions.find(o => o.text === name);
                if (match) {
                    newSelectedKeys.push(match.key as string);
                } else {
                    const ghostKey = `MISSING_${name}`;
                    ghostOptions.push({
                        key: ghostKey,
                        text: `${name} (Item not found)`,
                        styles: {
                            root: { color: '#d13438', fontStyle: 'italic' }
                        }
                    });
                    newSelectedKeys.push(ghostKey);
                }
            });

            setFinalOptions([...loadedOptions, ...ghostOptions]);
            setSelectedKeys(newSelectedKeys);
        }
    }, [props.currentValue, loadedOptions, loading]);

    const onChange = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
        if (option) {
            const newSelection = option.selected
                ? [...selectedKeys, option.key as string]
                : selectedKeys.filter(k => k !== option.key);

            setSelectedKeys(newSelection);

            const namesToSave = finalOptions
                .filter(o => newSelection.includes(o.key as string))
                .map(o => {
                    if (String(o.key).startsWith("MISSING_")) {
                        return o.text.replace(" (Item not found)", "");
                    }
                    return o.text;
                });

            props.onChange(namesToSave.join('; '));
        }
    };

    const comboBoxStyles: Partial<IComboBoxStyles> = {
        root: { maxWidth: '100%' }
    };

    if (loading) {
        return <Spinner size={SpinnerSize.small} label="Loading options..." />;
    }

    // If error, show a red message bar instead of the dropdown
    if (errorMessage) {
        return (
            <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
                {errorMessage}
            </MessageBar>
        );
    }

    return (
        <Stack>
            <ComboBox
                multiSelect
                selectedKey={selectedKeys}
                options={finalOptions}
                onChange={onChange}
                styles={comboBoxStyles}
                allowFreeform={true}
                autoComplete="on"
                disabled={props.isDisabled}
                placeholder="--- Select Items ---"
            />
        </Stack>
    );
};