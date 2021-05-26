
export default function Index(props) {
    return (
        <div className="text-white">
            dota
        </div>
    )
}


export async function getServerSideProps(context) {
    return {
        props: {
        },
    }
}
