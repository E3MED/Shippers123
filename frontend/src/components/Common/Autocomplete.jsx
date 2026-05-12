import React, { useState, useRef, useEffect } from 'react';

const Autocomplete = ({ options, value, onChange, placeholder, label, required }) => {
    const [inputValue, setInputValue] = useState(value?.label || '');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState(options);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setInputValue(value?.label || '');
    }, [value]);

    const handleInputChange = (e) => {
        const searchValue = e.target.value;
        setInputValue(searchValue);
        setIsOpen(true);

        const filtered = options.filter(option =>
            option.label.toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredOptions(filtered);
    };

    const handleSelect = (option) => {
        setInputValue(option.label);
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="form-group" ref={wrapperRef}>
            {label && (
                <label className={`form-label ${required ? 'required' : ''}`}>
                    {label}
                </label>
            )}
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    className="form-input"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                />
                {isOpen && filteredOptions.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        {filteredOptions.map((option, index) => (
                            <div
                                key={index}
                                onClick={() => handleSelect(option)}
                                style={{
                                    padding: '0.75rem',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid var(--border-color)',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--background-light)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Autocomplete;
