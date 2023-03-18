import { IconCircleNumber2 } from '@tabler/icons'
import React from 'react'
import { useIntl } from 'react-intl'

const Duration = ({ setDuration, duration }) => {
    const intl = useIntl()
    return (
        <div
            className="flex-none mr-6 flex-col items-start"
            style={{ display: "flex", width: "180px" }}
        >
            <div className="flex items-center mb-2">
                <IconCircleNumber2 color="rgb(110 231 183)" />
                <span className="ml-2">
                    {intl.formatMessage({id: 'new.duration'})}<font color="#CA0935">*</font>
                </span>
            </div>
            <input
                type="number"
                className="rounded block"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{ width: "180px" }}
            />
        </div>
    )
}

export default Duration