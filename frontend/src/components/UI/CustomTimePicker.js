import React, { useState, useEffect, useRef } from 'react';
import './CustomTimePicker.css';

const CustomTimePicker = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedHour, setSelectedHour] = useState('09');
    const [selectedMinute, setSelectedMinute] = useState('00');
    const dropdownRef = useRef(null);

    // Initial value parsing
    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':');
            if (h && m) {
                setSelectedHour(h);
                setSelectedMinute(m);
            }
        }
    }, [value]);

    // Outside click handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Scroll to selected time when opened


    // Hours reordered to start from 09:00 for business context
    // Scroll to 09:00 (default business start) when opened
    // Scroll to 09:00 (default business start) when opened
    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const defaultStartHour = '09';

            // Use setTimeout to ensure render is complete
            setTimeout(() => {
                if (!dropdownRef.current) return;

                const hourEl = dropdownRef.current.querySelector(`.time-item[data-value="${defaultStartHour}"]`);

                if (hourEl && hourEl.offsetParent) {
                    // Directly set scrollTop of the container
                    hourEl.offsetParent.scrollTop = hourEl.offsetTop;
                }
            }, 0);
        }
    }, [isOpen]);


    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')); // 00, 05, ... 55

    const handleTimeSelect = (h, m) => {
        const newHour = h !== null ? h : selectedHour;
        const newMinute = m !== null ? m : selectedMinute;

        setSelectedHour(newHour);
        setSelectedMinute(newMinute);

        onChange(`${newHour}:${newMinute}`);
    };

    return (
        <div className="custom-time-picker" ref={dropdownRef}>
            <div
                className={`time-display ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="time-text">{selectedHour}:{selectedMinute}</span>
                <span className="clock-icon">🕒</span>
            </div>

            {isOpen && (
                <div className="time-dropdown">
                    <div className="time-column">
                        <div className="column-header">Saat</div>
                        <div className="column-list">
                            {hours.map(h => (
                                <div
                                    key={h}
                                    data-value={h}
                                    className={`time-item ${h === selectedHour ? 'selected' : ''}`}
                                    onClick={() => handleTimeSelect(h, null)}
                                >
                                    {h}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="time-separator">:</div>
                    <div className="time-column">
                        <div className="column-header">Dk</div>
                        <div className="column-list">
                            {minutes.map(m => (
                                <div
                                    key={m}
                                    data-value={m}
                                    className={`time-item ${m === selectedMinute ? 'selected' : ''}`}
                                    onClick={() => handleTimeSelect(null, m)}
                                >
                                    {m}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomTimePicker;
