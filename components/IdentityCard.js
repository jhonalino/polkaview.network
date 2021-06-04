import Identicon from '@polkadot/react-identicon';
import { capitalCase } from "change-case";

function toShortAddress(_address) {

    const address = (_address || '');

    return (address.length > 13)
        ? `${address.slice(0, 6)}…${address.slice(-6)}`
        : address;

}

export default function IdentityCard(props) {

    const { style, address, display, legal, isValidator, isNominator, judgements, isPrimeCouncil, isCouncil, free, reserved, isRegistrar, riot, web, twitter, email, subs } = props;

    return (
        <div className="text-white box-border w-full p-1" style={style}>
            <div className='w-full h-full flex flex-col md:flex-row items-start justify-start bg-kinda-black rounded-sm p-4'>
                <div className="flex md:flex-col w-full h-full justify-center items-center">
                    <div className={`h-12 w-12 flex-shrink-0 md:h-44 md:w-44 border-2 ${props.suffix === 'dot' ? 'border-dot' : 'border-ksm'} rounded-full box-content p-2 bg-black`}>
                        <Identicon
                        style={{
                            height: '100%',
                            width: '100%',
                        }}
                            value={address}
                            size={'100%'}
                            theme={'polkadot'}
                        />
                    </div>
                    <div className="flex flex-col items-center justify-center w-full pl-4 text-center md:mt-4">
                        <p className="text-gray-300">
                            {display}
                        </p>
                        <p className="text-gray-400 text-sm">
                            {legal}
                        </p>
                        <p className="text-gray-500 text-xs">
                            <span className="lg:hidden">
                                {toShortAddress(address)}
                            </span>
                            <span className="hidden lg:inline text-lg">
                                {address}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex flex-col mt-4">
                        <div className="text-md text-gray-500">
                            free: <span className={`text-${props.suffix === 'ksm' ? 'ksm' : 'dot'} font-secondary`}>{free} </span>
                        </div>
                        <div className="text-md text-gray-500">
                            reserved: <span className={`text-${props.suffix === 'ksm' ? 'ksm' : 'dot'} font-secondary`}>{reserved} </span>
                        </div>
                        <div className="my-1"></div>
                        <div className="text-md text-gray-500">
                            twitter: <span className={`text-${props.suffix === 'ksm' ? 'ksm' : 'dot'} `}>{twitter || '-'}</span>
                        </div>
                        <div className="text-md text-gray-500">
                            email: <span className={`text-${props.suffix === 'ksm' ? 'ksm' : 'dot'} `}>{email || '-'}</span>
                        </div>
                        <div className="text-md text-gray-500">
                            web: <span className={`text-${props.suffix === 'ksm' ? 'ksm' : 'dot'} `}>{web || '-'}</span>
                        </div>
                        <div className="text-md text-gray-500">
                            element: <span className={`text-${props.suffix === 'ksm' ? 'ksm' : 'dot'} `}>{riot || '-'}</span>
                        </div>
                        <div className="my-1"></div>
                        <div className="text-md text-gray-500">
                            subs count: <span className={`text-${props.suffix === 'ksm' ? 'ksm' : 'dot'} `}>{subs.length}</span>
                        </div>
                        <div className="text-md text-gray-500">
                            staking:
                        {
                                isValidator && (
                                    <span className="text-blue-400 inline-block mx-1">
                                        validator
                                    </span>)
                            }
                            {isNominator && (
                                <span className="text-purple-400 inline-block mx-1">
                                    nominator
                                </span>)
                            }
                            {!isValidator && !isNominator && (
                                <span className={`text-${props.suffix === 'ksm' ? 'ksm' : 'dot'} mx-1`}>-</span>
                            )}
                        </div>
                        <div className="text-md text-gray-500">
                            judgements:
                        {
                                judgements.map(function ({ index, result, textColorClass }) {
                                    return (<span key={index} className={`${textColorClass} inline-block mx-1`}>
                                        {capitalCase(result).toLowerCase()}
                                    </span>)
                                })
                            }
                            {
                                judgements.length === 0 && (
                                    <span className={`text-${props.suffix === 'ksm' ? 'ksm' : 'dot'} mx-1`}>-</span>
                                )
                            }
                        </div>
                    </div>
                    <div className="my-1"></div>
                    <div className="text-center w-full">
                        <div className="flex flex-wrap justify-start font-bold text-lg uppercase">
                            {isRegistrar && (
                                <span className="text-yellow-100 inline-block mr-1">
                                    registrar
                                </span>)
                            }
                            {isPrimeCouncil && (
                                <span className="text-yellow-300 inline-block mr-1">
                                    prime council
                                </span>)
                            }
                            {(isCouncil && !isPrimeCouncil) && (
                                <span className="text-pink-400 inline-block mr-1">
                                    council
                                </span>)
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};