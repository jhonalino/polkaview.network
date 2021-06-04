import Link from 'next/link';

export default function Header(props) {

    const { suffix } = props;

    return (
        <header className="flex p-4 items-center justify-between">
            <div className="flex items-center justify-start">
                <Link href="/" >
                    <a>
                        <img src="/polkaview-logo.png" className="w-56" />
                    </a>
                </Link>
            </div>
            <div className="text-right flex justify-end">
                <Link href={suffix === 'dot' ? '/ksm/identities' : '/dot/identities'} >
                    <a className={`text-${suffix === 'dot' ? 'ksm' : 'dot'} mb-2 text-right`} >
                        <span className="text-gray-500">switch to </span> {suffix === 'dot' ? 'kusama' : 'polkadot'}
                    </a>
                </Link>
            </div>
        </header>
    );

};